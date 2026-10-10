# Outfit hairstyles

Added on the isolated `codex/outfit-hairstyles` branch, 8 October 2026. Awaiting the user's visual review.

The user asked for hair as part of an outfit, keeping the doll's existing dark brown colour. Requested styles: long straight hair with a V-shaped hem reaching mid-back at the longest point, the same cut with a slight wave, a high ponytail and a high bun. Additional styles should be achievable without a haircut. This implementation adds a low ponytail, low bun, half-up twist and side braid, and retains the original bob.

## Behaviour

- `hairId` is saved in each outfit recipe and browser draft. Old and invalid values fall back to `bob`.
- Clothing presets preserve the chosen hairstyle. Restoring a saved look restores both hair and clothes. Reset restores the original outfit and bob.
- Changing hair alone does not rebuild garments. No service/API requests or generated images are needed.
- Hair is attached to the existing `doll-head`, so it follows its tilt. The flower remains. All original bob meshes, including its swept fringe and fringe threads, are hidden while an alternative style is worn, then restored when returning to the bob. The user found the bob bangs awkward on the other styles, which now use their own open hairline.
- Geometry is stylised sculpted hair, not strand simulation. Down styles have a centre-long V silhouette. Up styles gather the same dark hair into different shapes. No colour, face, body, sock or shoe changes are made.

## Ownership and integration

All hair geometry, catalog and UI live in `src/hair/`. The garment catalog, `makeDoll`, `makeOutfit`, shared top helpers, `index.html` and clothing CSS are untouched. Minimal integration edits are in `src/doll/recipe.js`, `src/doll/app.js` and `src/doll/view.js`.

- `catalog.js`: stable IDs, labels, notes, colour and validation.
- `model.js`: procedural geometry plus `createHairController(doll)`; requires an existing named `doll-head` attachment point.
- `controls.js`: inserts its own labelled selector before the top selector. It does not own the top/bottom/shoe selector blocks.
- `tests/hair.test.js`: migration, geometry limits and V shape, preservation/restoration of doll meshes, resource disposal and outfit persistence.

Other agents can continue garment or shoe work. Keep the hair imports and the small recipe/app/view hooks when resolving shared-file conflicts. The hair controller must be disposed before the overall model is disposed. Future hoods and hats will need their own explicit hair compatibility rules; none are implemented here.

## Checks and limits

The existing garment suite and new hair tests pass on the integration snapshot. Geometry checks do not establish visual attractiveness or clearance against every future collar/hood. The separate in-chat hair preview keeps a classic outfit on her to make style comparison easy. Inspect long styles from the back and ponytails/buns from the side before approving their shapes.

Root fit revision: the scalp surface now follows the actual felt-head ellipsoid, tapering to a 0.0015-unit skin clearance at the hairline with volume growing towards the crown. Long lengths start against the back of the head and ease out into their drape, instead of beginning as a detached sheet. Visual review remains pending.

Soft-wave revision: only the wavy back panel now wraps around the head and eases inward below the nape. Small mirrored S waves fade at the roots and tips, and the V point is rounded. This replaces the abrupt flat rear-panel transition and sideways tip kick reported by the user. Other styles are unchanged; visual review pending.

Side braid (10 October 2026): the user said the first side braid looked like a side ponytail with a pinecone attached (three tight spiral strands under a thick lock). It is now a three-strand plait: the hair is gathered at the back and swept behind her left ear to the plait's top, and the plait is a chain of lobes that alternate either side of its centre line and slant towards it, making its chevrons, over a thin core, narrowing to a tie and a short tail in front of her shoulder (`sideBraid()` in `src/hair/model.js`).
