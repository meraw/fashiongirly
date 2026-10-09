# Wardrobe item: Dr. Martens Blaire Quad chain sandals

Authored 9 October 2026. Status: first interpretation awaiting the user's visual review. Fourth pair of shoes from the user's wardrobe list.

## Source and reference reading

The user sent seven product images: front three-quarter pair, back three-quarter close-up, top, buckle close-up, back, inner side and outer side. They were attached directly; no link was fetched. The label inside the heel reads BLAIRE II QUAD CHAIN.

Features read from the images:

- An open-toe platform strap sandal in glossy black patent leather.
- Three straps straight across the foot, plus an ankle strap round the back of the ankle, joined to the sole by an upright strap on each side.
- A chunky silver curb chain along the top of every strap, fixed with studs at each end.
- Large silver buckles engraved “Dr. Martens” on the outer side, with pointed, stitched tabs.
- Tonal stitching along the strap edges.
- A black heel pull loop lined in yellow, printed “With Bouncing Soles”.
- A black footbed.
- A tall Quad platform: fine horizontal ribbing all the way up, a welt with dashed yellow stitching, and a sawtooth tread.

## Implementation

Catalog ID `dr-martens-blaire-quad-chain-v1` (slot `shoes`), template `platform-sandal`. It is built by the cow slides' builder, `makePlatformSlide()` in `src/doll/model.js`, with new options that default to the old behaviour. The cow slides, sneakers, boots and loafers render pixel-identical to `main`.

- **Quad sole** (`sole.style: 'quad'`): straight walls ribbed all the way up (`rib`, `ribDepth`), with ridges shaded lighter and grooves darker so the ribbing reads on black, as dust and sheen make it read in the photos. The sawtooth tread has teeth pointing down (`toothTop`, `toothDepth`). The top layer above the welt is ribbed too, and the yellow welt stitching is dashed.
- **Patent straps** (`bands`): straight across the foot, draped over her bare foot like the slides' straps, in a glossy clearcoated black with tonal edge stitching.
  - Each strap has an alternating curb chain (`chain`), a stud at each end of the chain, and a rounded buckle frame with its prong and a pointed tab on the outer side (`buckleAt`).
- **Ankle strap** (`ankle`): a band round the back of her ankle, a little higher at the back, carrying a chain on the outer side and a buckle at the outer front. It is joined to the sole by an upright strap on each side. A black heel pull loop lined in yellow (`pullLoop`) stands up from the back.
- **Height and feet:** as with the cow slides, the footbed (0.142) is above her normal foot level, so she and her clothes rise by 0.032. Her socks are hidden, and her bare feet are the same smooth, toeless felt shape the user approved for the slides.
- **Layering:** long jeans rest on the straps and fall to the floor beside the platform; cropped jeans end above the ankle strap. No jeans code changed.
- **Styling notes** (catalog `styling`): open toe and heel, summer only, not for rain or cold; black with silver hardware and yellow stitching; edgy and hardware-heavy.

## Checks

- `npm test`: 63 passing. A new test checks:
  - the sandal's parts, and that the slide-only parts are absent;
  - the strap and buckle counts, and the chain links;
  - the lift, with the sole on the floor and her socks hidden;
  - the ribbed Quad sole;
  - that no part of her foot pokes through a strap, and the ankle strap clears her ankle.

  The layering test covers the sandals with every bottom.
- `npm run build` succeeds.
- The cow slides (bare and with long jeans), sneakers, boots and loafers render pixel-identical to `main`.
- Rendered in headless Chromium (software WebGL) next to the photos from four angles, with four pairs of jeans and on her full figure. The user has not yet seen it, and nothing has been checked on a device.

## Known differences

- The patent reads glossy only where the studio lights catch it; there is no environment reflection.
- The chains are simplified curb links. The buckle and pull-loop lettering is not reproduced.
- The ankle strap is one band with a buckle at the outer front.
- Her feet are toeless felt shapes.
