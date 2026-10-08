# Wardrobe item: Desigual black faux-leather jacket

Authored 8 October 2026. Status: first version, awaiting the user's visual review. Second piece of outerwear, added by the outerwear chat.

## Source and reference reading

The user sent five phone screenshots of an Amazon listing:

- on a model: front, front with arms crossed, back, and full length
- a front flat lay

No link was fetched, and the screenshots are not stored in the repository.

Features read from the screenshots:

- Glossy black faux leather with a fine, irregular crinkle that breaks up the highlights.
- A pointed shirt collar on a stand. The flat lay shows a printed Desigual logo lining inside the collar.
- A silver metal centre zip up to the collar.
- Front seams:
  - a yoke seam straight across the chest, about a fifth of the way down from the collar
  - a panel seam on each side, running down from the yoke to the zip pocket
- Pockets on each side, reaching from near the zip almost to the side seam:
  - a horizontal zip pocket, with its silver pull at the inner end
  - below it, a patch pocket with a box pleat, under a flap with a slightly pointed edge closed by a silver snap
- A wide black rib-knit hem band at the waist. The jacket is cropped and fairly fitted.
- Set-in sleeves, ruched above leather cuffs that close with a tab.
- Back: a centre seam and two long curved panel seams from the shoulders to the band.

Measured colours (flat lay): leather averages about RGB 40, 40, 43 (glossy panels up to about 59, 59, 65, with highlights near 90); rib band 17, 17, 17.

## Implementation

Catalog ID `desigual-black-faux-leather-jacket-v1` (slot `outerwear`). It is built by `makeLeatherJacket()` in `src/doll/outerwear.js` from its catalog `build` spec (template `leather-zip-jacket`). Worn zipped closed, as the user wears outerwear.

- **Shared jacket code.** The windbreaker's body, surface placement and centre zip moved into shared helpers, `jacketBody()` and `centreZip()`, used by both templates. This is additive: the windbreaker renders pixel-identical to its approved version (front, turn and back compared).
- **Leather.** A tileable crinkle, drawn locally as a height field. It drives a normal map that is shared by the leather and its glossy coat (clearcoat), so highlights break up along the creases the way they do in the photos. Separate repeats keep the crinkle the same size on the body, sleeves and small pieces. A first version with large, deep cells read as crocodile or crazy paving, so it was made much finer and softer.
- **Shape.** A fitted body from the collar stand down to a matte rib band at 1.13–1.20 (waist length), with broad soft creases instead of gathers. Over the skirt, the lower body and band sit out a little.
- **Point collar.** A leaf folded over the stand that lies on her shoulders and chest. Its front ends are cut to points either side of the zip, reaching down to about 1.78, below her chin, so the collar reads from the front. It has a rolled fold, edges and topstitching. Her hair hides it at the back.
- **Seams.** Each seam is a slight ridge with a row of tonal topstitching: the front yoke, the two front panel seams, the centre back and the two curved back panels.
- **Pockets.** On each side, a leather welt with a short silver zip and its pull at the inner end. Below it, a patch pocket with box-pleat stitching, under a flap with a slight point and a silver snap.
- **Sleeves and cuffs.** Set-in sleeves with the shared rounded shoulder cap, softly ruched above leather cuffs. Each cuff has topstitching, a tab on the back of the wrist and a silver stud.
- **Colours, by measurement.** The front renders about 60, 57, 57 (photo panels 59, 59, 65), the back about 47, 44, 44 (photo average about 40, 40, 43), and the rib about 22, 20, 19 (photo 17). The studio lights are a little warm. After measuring, the leather and rib were made slightly cooler and darker.
- **Preset.** “Leather jacket study”: the jacket over the off-shoulder stripe jumper with the Stradivarius relaxed jeans.

## Layering

It uses the same rules as the windbreaker: closed, hides the top's sleeves, closes over the shirt collar and covers the skirt's bow. Being cropped at the waist, it lets longer tops show below its band; the lilac top's hem shows as a thin line.

Under this slimmer jacket, the pointelle jumper's raglan seams poked through near the underarm: those seams are drawn on the jumper's body, not inside its hidden sleeves. Easing the jacket's upper sleeve slightly fixed it. No code in the tops was changed.

## Checks

- The outerwear tests now cover any jacket. They find the covering surfaces and cuffs by tags on the meshes rather than by name. They run for both jackets:
  - every top, bottom and the skirt is covered
  - the top's sleeves are hidden and its body stays on
  - her arms and hands stay inside the sleeves and cuffs
  - every jacket has a study preset
- A new test for this jacket checks:
  - its parts: collar, seams, pockets, zips, rib band, cuffs and tabs
  - the glossy crinkled material and the matte rib
  - that the collar points reach her chest
  - the cropped hem
  - build time (about 120 ms after the first build)
- `npm test`: 49 passing after merging `main`; `npm run build` succeeds.
- Rendered in headless Chromium:
  - from the front, a turn, the side and the back, with close-ups at twice the resolution
  - over the classic layers, the plaid jumper with the skirt, and the lilac top with the Mango black jeans, boots and long hair

  The authoring chat checked these renders; the user has not seen them yet.

## Known differences

- The logo lining is not modelled.
- In the flat lay, the side panels under the arms may be a matte material; here they are leather.
- The crinkle is procedural and does not copy the photo's creases. The cuff tab's position is read from one photo.
- On her short, wide torso the pockets sit close to the sleeves, so from straight in front the outer ends of the pockets are partly behind her arms.
