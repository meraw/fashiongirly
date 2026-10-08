# Reference test: Desigual bronze mesh top

Status: user responded “This is really nice” after the sleeve-clearance correction and requested another garment. Authored 8 October 2026.

## Source and observed construction

The user supplied front and back product photos, named `1000048765.jpg` and `1000048766.jpg`, and identified the garment as a Desigual mesh top. Original photos are not bundled in the app or repository. The user supplied this description to help with the test but expects future authoring to infer details from pictures without requiring a written inventory.

Visible features: close-fitting long sleeves, a black bound crew neck, horizontal glitter-bronze and opaque-black bands, a large front-facing Buddha print on both the front and back, neon green outlined sleeve graphics, and soft pale airbrushed patches. The necklace, shorts and belt are styling accessories in the photo, not parts of the top. The user calls the sleeve writing Japanese; its exact characters and meaning could not be reliably transcribed from these views.

## Representation

- Stable catalog ID: `desigual-bronze-mesh-v1` in `src/wardrobe/catalog.js`.
- Separate fitted geometry in `src/doll/model.js`, adapted to the existing compact doll. No body or face redesign.
- Local generated print atlas in `src/wardrobe/bronze-atlas.js`, encoded as WebP data for portable static loading. The stored image is 1024 × 1024, divided into torso and sleeve regions.
- Neck and hem binding use separate geometry. Sleeve geometry is tapered, independent of the balloon-sweater settings.
- Fine procedural pinholes approximate mesh in alternating bands. Material sheen, metallic response and colour flecks approximate the bronze finish. This is not measured fabric reconstruction or cloth simulation.
- Outfit recipes save `topId`; old recipes default to the classic layers. Selecting this top excludes the knit and striped shirt for this first fitting test. Fit is deliberately fixed while evaluating recognition and clearance.

## Asset review and remaining differences

The generated atlas initially depicted the back of a Buddha in its top-right region, which is incorrect for the supplied back photo. That region is not used. The front-facing top-left motif is mapped to both the front and back of the garment. Their exact differences are not yet reconstructed.

The print and sleeve symbols are interpretive generated artwork, not exact extracted artwork or verified text. The texture's flat layout was inspected. Physical transparency, glitter response, side seams, print scale and sleeve orientation still need review on the rendered doll. User feedback: “There are two strange holes at the elbow, but it looks very good besides that.” Geometry analysis found arm vertices penetrating both fitted sleeves around the elbow. The sleeves were re-centred and given local clearance; a raycast regression test now checks that the elbow surfaces remain inside the sleeves. Print and materials were preserved. Geometry and UI tests do not establish fidelity.

## Authoring and automation boundary

The built-in image-generation tool was used once during development; no image-generation or analysis service is called by the application. Image encoding/resizing produced the bundled WebP. Future reference authoring should infer the structured feature list, distinguish clothing from accessories, mark uncertain text or hidden details, generate or author assets, and validate the result before adding it to the catalog. That end-to-end process is not yet automated.

## Generation prompt

```text
Use case: stylized-concept. Asset type: garment UV fabric atlas for a 3D doll, NOT an outfit rendering. Both input images are reference images of the same Desigual top (front and back). Reconstruct just the fabric print flattened into a square texture atlas divided into FOUR equal square quadrants with NO gutters, borders, labels or white margins. Top-left quadrant: front torso print, top-right: back torso print, bottom-left: left sleeve print, bottom-right: right sleeve print. Every quadrant filled edge-to-edge with flat black and glittering bronze horizontal stripes, about 6 bronze bands alternating 6 opaque black bands per quadrant. Upper quadrants have the antique dark bronze Buddha head and torso printed centrally at large scale across the stripes, following the references, with the pale hazy white highlight across chest and lower print. Sleeve quadrants have the oversized thin neon mint-green outlined glyph-like graphics seen in references with intermittent white airbrushed blurry patches. Reproduce the visible graphic forms without inventing readable phrases. Very detailed dark antique statue face and robe etching, fine glitter flecks. Flatten the pattern completely: no human, no skin, no hair, no necklace, no shorts, no garment silhouette, no collar, no folds, no lighting gradients from photography. Orthographic texture map only, full bleed at every edge. Match the actual muted antique bronze and black with green outline accents, not cartoon Buddha faces. Square atlas.
```

## Sleeve ends eased over her hands

On 8 October 2026, with the user's agreement, `makeReferenceTop()` began easing each sleeve's end and its bound hem over her mitten and thumb (`easeOverHand()`). Before, they cut through the thumb and the edge could look jagged. The shared hand test now covers this top.
