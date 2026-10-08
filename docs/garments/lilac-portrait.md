# Reference test: lilac portrait mock neck

Authored 8 October 2026. Status: first interpretation awaiting user visual feedback.

## Reference reading

The user supplied front and back photographs (`1000048769.jpg`, `1000048770.jpg`) without a written feature list. Features were inferred from those pictures: a mauve/lilac portrait and floral front with a vertical rib-like texture, a plain pale silvery-lilac textured back, dark navy sleeves with alternating bands of tiny circles and blue dots, a short raised collar, a longer fitted body, and some wrist gathering. Brand, fibre composition and exact construction are not confirmed. The photographed model, trousers and hair accessory are not part of the garment.

## Implementation

Catalog ID `lilac-portrait-mockneck-v1`. Generated fabric artwork is bundled in `src/wardrobe/lilac-atlas.js` as an 896 × 896 WebP data URI. `model.js` shares the corrected fitted-sleeve foundation with the bronze top but gives this piece a longer torso, separate mock-neck geometry with rib details, and subtle cuff gathering. Front and back use separate material groups and atlas quadrants; the portrait is not repeated on the back. This piece uses opaque materials, not the bronze top's mesh cutouts. The lighter back has a separate sheen response.

The built-in image-generation tool created the texture during authoring. The runtime only loads the bundled asset; no AI API is called. Artwork is an interpretation, not an exact extraction of the reference print. The generated atlas was inspected; fit, portrait scale, seam transitions and sheen on the doll await user review. Both tops pass the elbow-clearance regression check. The full test suite has 17 passing tests and the static build succeeds.

## Generation prompt

```text
Use case: stylized-concept. Asset type: full-bleed square four-panel fabric texture atlas for a 3D garment. Two input pictures are front and back references of the SAME shirt. Reconstruct its fabric design flattened, not the model wearing it. Four equal quadrants, NO borders, gutters, labels or margins: TOP LEFT = front torso with lilac/mauve fine vertical knitted-rib print, a faded portrait of a dark-haired woman in dark hat centred in upper half, her pale clothing fading into lilac, small pink/red flowers and green leaves across middle/lower front exactly inspired by reference. TOP RIGHT = back torso: plain pale silvery dusty-lilac fine woven metallic fabric, NO portrait, NO flowers. BOTTOM LEFT and BOTTOM RIGHT = dark navy long-sleeve fabric: broad alternating dark slate navy bands with tiny outlined circles and deep blue bands with densely packed tiny blue dots; match the reference small-scale micro-patterns, not big decorative symbols. Every panel filled edge to edge as rectangular fabric. Flat orthographic albedo print, no lighting cast shadows or garment folds, no collar silhouette, no arms, no skin, no human body, no pants, no photographic background. The printed woman's portrait on the front fabric must remain; remove the actual photographic model. Faithfully use the muted violet and navy colour palette of the supplied garment, not the previous bronze shirt. Fine rich textile detail, photorealistic printed textile. Square.
```

## Lower-hem correction

The user reported two holes near the bottom where trousers showed through. A clearance test reproduced trouser-hip and side-seam penetration. The lower torso and hem now ease outward over the trousers. The regression test covers hips, waistband, button and seam vertices with narrow, medium and wide jeans. The print and upper garment are preserved. The correction awaits visual confirmation.

## Sleeve ends eased over her hands

On 8 October 2026, with the user's agreement, `makeReferenceTop()` began easing each sleeve's end and its bound hem over her mitten and thumb (`easeOverHand()`). Before, they cut through the thumb and the edge could look jagged. The shared hand test now covers this top.
