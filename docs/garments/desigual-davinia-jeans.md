# Wardrobe item: Desigual Davinia heart jeans

Authored 8 October 2026. Status: crotch rebuilt after the user found it strange; awaiting their look at the fix. Third piece from the user's wardrobe list and the first built on the shared jeans template.

## Source and reference reading

The user sent four phone screenshots of a Ceneo listing (“Desigual Jeansy Davinia 22SWDD01”): front on a model, a waist and pocket close-up, a front flat lay, and the back on a model. No link was fetched (Ceneo had blocked automated access before).

Features read from the screenshots:

- High rise; slim straight legs cropped at the ankle with a raw, slightly frayed hem.
- Light blue acid (stone) wash with marbling, paler on the thighs.
- Raw, frayed top edge on the waistband; belt loops; a copper shank button.
- Orange-copper contrast stitching.
- Scoop front pockets; a coin pocket on the wearer's right with a small red embroidered heart.
- Small light abrasions near the pocket and on the thigh.
- Back: V yoke, plain patch pockets, and a brown leather patch on the waistband.

The black mules in the photos are styling.

## The jeans template

From this pair on, all catalog jeans are built by `makeJeans(id, spec, swatch)` in `src/doll/model.js`. Each pair's catalog entry holds a `build` spec: hip and leg rows, rise and waistband, hem type (`rests-on-shoe` or `raw-crop`), folds, leg twist, knee seams, front pocket type (`slant` or `scoop`), coin pocket and embroidery, abrasions, back pocket outline and optional flap, yoke, welt, label patch, thread and button colours, texture repeats and a fallback colour. The approved barrel jeans were moved onto the template first; a fingerprint of every vertex position, colour and UV of their meshes was identical before and after.

## Implementation

Catalog ID `desigual-davinia-jeans-v1` (slot `bottom`).

- Fit: waistband 1.25 to 1.30 (higher than the barrel jeans' 1.17 to 1.22); slim straight legs taken in as far as the doll's legs allow, with the hips blending into them at the crotch; cropped at 0.34, above her socks and loafers. A test checks that no doll leg or sock vertex between the hem and the crotch shows through.
- Denim: a swatch from the flat lay (the left leg between knee and hem, inside its seams), processed like the barrel jeans' swatch: divided by a blur of itself (radius 45 px, keeping more of this wash's larger marbling), calibrated, made seamless, 256 × 640 WebP in `src/wardrobe/desigual-davinia-denim.js`. A first crop caught background where the leg narrows and was redone.
- Colour: photos measured RGB 157, 166, 182 (flat lay) and 164, 170, 185 (front on model). The first render was 179, 184, 194 (too light and grey); after recalibration the front render measures 165, 173, 187 and the back 158, 166, 182.
- Details: frayed waistband threads, copper button and orange stitching, scoop pockets with double stitching, the coin pocket with a filled red heart and darker edge, four small abrasion patches, plain back patch pockets, V yoke, centre-back seam, leather patch, and a frayed raw hem.
- Light folds only; no twist, knee seams or stacking.

## Crotch construction

The user found the first version strange at the crotch. The hips were one rounded shell and each leg a separate tube pushed up into it, so the hips' lower edge stood out past the slimmer legs: a pouch at the front, a ledge at the back and a step from the side. Pulling the hips in toward each leg's centre made a scooped dish with two lobes; flattening their depth still left a visible crease where the surfaces crossed.

The template now builds the jeans as they are sewn (`build.crotch`). Above `crotch.top` the hips keep their rounded outline; below it, each ring's outline morphs into the outer edge of the two legs, reaching exactly that outline at `crotch.y`, where each leg tube begins on it. Nothing overlaps or crosses. The leg folds fade out just below the crotch so each leg's top edge meets the hips exactly, and the hips' bottom edge takes the legs' surface direction so the shading flows across the join. Denim is laid by distance along the fabric (`uvScale`) on both hips and legs; on the hips it follows the original rounded outline, so the pattern folds in with the fabric instead of shearing. Texture wraps fall on the centre-back seam and the inseams. One leg's surface initially faced inward (its rings ran the other way) and rendered darker; both legs' rings now run the same way.

## Checks

- `npm test`: 21 passing. The layering test now covers every catalog bottom under every waist-covering top. It checks the top's body only: her arms hang against her hips, so at this higher waistband the jumper's sleeve passes over the waistband's side, where the waistband is hidden inside the sleeve. A new Davinia test checks its details, the crop height and leg clearance.
- `npm run build` succeeds.
- Rendered in headless Chromium from four angles, without a top for the waist details, and under every top and the skirt; compared side by side with the flat lay and back photos. The user has not seen it yet.

## Known differences

- On her short, round legs the slim straight cut still reads fuller than on the model.
- The swatch's marbling repeats around each leg.
- The leather patch carries no lettering; abrasions are simple patches.
