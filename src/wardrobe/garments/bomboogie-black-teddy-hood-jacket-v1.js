// Wardrobe item: Bomboogie black teddy jacket with detachable hood. Record: docs/garments/bomboogie-teddy-hood-jackets.md.
// One garment per file (see src/wardrobe/garments/index.js); the entry is the same as a catalog.js entry, plus its study.
export default {
    slot: 'outerwear',
    id: 'bomboogie-black-teddy-hood-jacket-v1', name: 'Bomboogie black teddy jacket with detachable hood', family: 'teddy-hood-jacket', version: 1, label: 'Bomboogie black teddy jacket with detachable hood · reference study',
    status: 'user-approved', brandAsProvided: 'Bomboogie (the neck label and the zip pull)',
    source: { note: 'user supplied four product images of the green one (front closed with the hood down, back, side three-quarter with the hood up, front open with the bib zipped) and said they own two identical jackets, one green and one black (they first wrote blue and corrected it to black), and that the quilted hood and front zip part come off; they asked for that to be an option in the app' },
    referenceViews: ['front, closed, hood down', 'back, hood down', 'side three-quarter, hood up', 'front, open, bib zipped'],
    details: ['boxy cropped jacket in curly teddy (bouclé faux shearling) in black', 'wide flat teddy collar', 'silver two-way metal zip up the centre front', 'dropped shoulders and wide straight sleeves', 'all edges rolled teddy', 'detachable insert in quilted glossy nylon: a hood, worn down here, joined to a bib with its own tonal zip, zipped into the jacket along its front edges', 'drawcord toggles at the sides of the hood (not modelled: under her chin)', 'nylon lining'],
    material: { construction: 'curly teddy faux shearling shell; quilted glossy nylon insert, padded', composition: 'not stated in the supplied images', finish: 'curly, matte pile; glossy quilted nylon' },
    fit: { silhouette: 'boxy and cropped, dropped shoulders', length: 'high hip', sleeve: 'long, wide and straight', wear: 'zipped closed, as the user wears outerwear unless it is designed to be worn open; it can be shown open, and with or without the hood and bib', adjustment: 'its own boxy size on her, easing out only where the layers under it need room' },
    // Closed, it hides the top's collar points and sleeves; it can be worn open, and its hood and bib come out.
    layering: { closed: true, canOpen: true, coversTopSleeves: true, coversWaistband: true, detachable: { label: 'Wear the quilted hood and bib' } },
    styling: {
      observed: { palette: ['black'], pattern: 'plain; texture from the curly pile and the quilting', silhouette: 'boxy cropped teddy jacket with a wide collar, and a quilted puffer hood and bib zipped in', coverage: 'torso to the high hip and arms to the wrist; the hood lies down on her back', material: 'teddy faux shearling, quilted nylon' },
      inferred: { warmth: 'warm with the padded hood and bib zipped in, for cold days; a little lighter without them', weather: 'cold, dry days; the nylon hood copes with a shower better than the teddy', mood: 'cosy and sporty', unknown: ['fibre composition', 'padding', 'water resistance'] },
    },
    uncertainties: ['no photo of the black one was supplied: it is the green one in black, its teddy and nylon set to a soft black like the cropped hoodie\'s fleece', 'the teddy is a procedural curl texture, not copied', 'the hood is only shown worn down; on the doll her large head covers her neck, so its rim shows at the sides of her neck and the pouch on her back, and the cord toggles under her chin are left off', 'the label is not modelled'],
    authoring: { template: 'makeTeddyJacket() in src/doll/teddy-jacket.js (the teddy-hood-jacket template)', texture: 'procedural curly teddy and quilted nylon in src/doll/teddy-jacket.js', runtimeGeneration: false, sourcePhotosBundled: false },
    // Construction for makeTeddyJacket(), in outfit units: the fur jacket's boxy cropped body and dropped-shoulder sleeves,
    // eased out over anything under it by at least `fit.gap`.
    build: {
      template: 'teddy-hood-jacket',
      colours: { teddy: '#161618', nylon: '#1f2023', lining: '#18191b', insertZip: '#2a2b2f', quiltStitch: '#0c0c0e', metal: '#b9b9bd' },
      teddy: { sheen: .5, sheenLight: .3, bump: .04, tiles: { body: [7, 2.5], sleeve: [4, 2.5], trim: [3, 1.5] } },
      nylon: { roughness: .32, clearcoat: .6, clearcoatRoughness: .2 },
      fit: { gap: .014 },
      body: {
        rows: [[1.955, .14, .133], [1.93, .141, .134], [1.9, .148, .138], [1.875, .207, .165], [1.84, .276, .207], [1.8, .318, .229], [1.75, .336, .239], [1.65, .338, .241], [1.5, .338, .243], [1.4, .338, .243], [1.3, .338, .243], [1.2, .336, .241], [1.17, .334, .239], [1.15, .331, .236]],
        hem: 1.15, roll: .013, edge: .011, lump: .009,
        collarBase: 1.875, collarTop: 1.955,
      },
      // Open, each front edge hangs this far out from the centre.
      open: { shift: .07 },
      zip: { width: .013, slider: 1.845 },
      collar: { gap: .07, gapOpen: .02, spread: .32, foldFront: 1.93, foldBack: 1.975, dropFront: .13, dropBack: .11, lift: .022, roll: .015 },
      sleeve: {
        rows: [[.045, .126, .12], [0, .14, .134], [-.1, .145, .139], [-.25, .144, .138], [-.38, .142, .137], [-.45, .14, .135], [-.5, .138, .133]],
        cuff: [-.5, -.565], cuffRadius: [.138, .133], cuffRoll: .011,
      },
      // The detachable insert. The bib: its neck rises this far above the jacket's collar top; open, it shows between the
      // fronts from `bottom` up, `half` wide each side, puffed by `puff` between the stitch `lines`, set `inset` inside the
      // fronts, with its zip `zipWidth` wide. The hood, worn down: a pouch on her back from `top` to `bottom` (rounded at
      // its lower corners), lifted off the back by `lift`, quilted (`quilt`, the share of its depth that dips at the
      // stitch `lines`, along it from top to bottom), its rolled `edge`; its `rim` round her neck from angle `from`
      // either side of the front, rising by `rise` at the back, standing `out` from the bib's neck.
      insert: {
        bib: { neckRise: .022, bottom: 1.19, half: .1, puff: .007, inset: .012, zipWidth: .009, lines: [1.19, 1.27, 1.35, 1.43, 1.51, 1.59, 1.67, 1.75, 1.82, 1.875] },
        hood: { top: 1.9, bottom: 1.6, round: .07, halfWidth: .22, lift: .085, quilt: .4, edge: .013, lines: [0, .3, .62, 1], rim: { from: 1.15, rise: .06, out: .045, radius: .032 } },
      },
    },
    // The study preset: added to the outfit ideas with the other outerwear studies.
    study: { name: 'Black teddy jacket study', note: 'Reference study: the same Bomboogie teddy jacket in black, as the user owns it in green and black, with its quilted glossy nylon hood and bib zipped in. No photo of the black one was supplied.', recipe: { topId: 'lapis-blue-linen-button-down-shirt-v1', bottomId: 'mango-washed-black-v1' } },
};
