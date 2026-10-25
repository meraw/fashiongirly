// Wardrobe item: Oversized black satin shirt. Record: docs/garments/black-satin-oversized-shirt.md.
// One garment per file (see src/wardrobe/garments/index.js); the entry is the same as a catalog.js entry, plus its study.
export default {
    slot: 'top',
    id: 'black-satin-oversized-shirt-v1', name: 'Oversized black satin shirt', family: 'oversized-button-down-shirt', version: 1,
    // Merging this garment's pull request is the user's approval (their rule, 9 October 2026).
    status: 'user-approved', brandAsProvided: 'none given',
    source: { note: 'the user asked for "an oversized black satin button-up with an ample neckline", without photos or further description; built as a classic oversized satin shirt' },
    referenceViews: [],
    details: ['black satin with a soft lustre', 'oversized and boxy, to the top of her thigh, with a curved shirt-tail hem', 'an ample neckline: worn open in a deep V, the point collar spreading wide', 'small black buttons from the V to the hem', 'full long sleeves into buttoned cuffs', 'a back yoke', 'tonal stitching'],
    material: { construction: 'woven satin', composition: 'not stated (satin is usually polyester, viscose or silk)', finish: 'smooth and fluid, with a soft lustre' },
    fit: { silhouette: 'oversized and boxy', sleeve: 'full and long, into buttoned cuffs', hem: 'top of the thigh, curved shirt tail', neckline: 'open in a deep V under a wide point collar', adjustment: 'fixed authored fit for review' },
    exclusions: ['striped-shirt','knit-sweater'],
    // Hangs over every waistband; over the skirt it is tucked in, so the skirt's bow shows.
    layering: { coversWaistband: true, tucksIntoSkirt: true },
    uncertainties: ['no photos: the cut, collar, buttons, the depth of the neckline and the exact shade are a classic oversized satin shirt chosen for the description, not read from the user\'s shirt', 'worn open at the neck, as the user asked for an ample neckline (her other shirts are worn buttoned to the top)', 'the satin is drawn in code'],
    styling: { silhouette: 'oversized and boxy, to the top of the thigh with a curved hem', palette: ['black'], pattern: 'plain, with a satin lustre', coverage: { neck: 'open in a deep V', sleeves: 'long, cuffed', midriff: 'covered' }, material: 'satin', warmth: 1, warmthBasis: 'inferred: a light, fluid woven shirt, long-sleeved', weather: 'mild days, or evenings under a jacket; not for cold on its own, and satin spots in the rain', rain: 'avoid', layering: 'In the app it goes under every jacket and coat, and with every bottom and the skirt; its hem hangs over every waistband; over the skirt it is tucked in and the bow shows.', unknown: ['fibre composition', 'the depth of the neckline and the buttons on the real shirt'] },
    authoring: { template: 'makeSatinShirt() in src/doll/satin-shirt.js (the satin-shirt template, on the button-down shirt template)', texture: 'procedural satinData() in src/doll/satin-shirt.js', runtimeGeneration: false, sourcePhotosBundled: false },
    // The satin's colour (calibrated to render a soft black), the variation of its warp floats (`lustre`), the sheen and how
    // soft its highlights are; then the shirt's style settings (outfit units).
    build: {
      template: 'satin-shirt',
      colour: '#1e1d22', lustre: .04, seed: 3, sheen: '#6f6c78', roughness: .5,
      stitch: '#141316', button: ['#0b0a0c', .2],
      // Open in a deep V down to the first button, with a wide point collar lying open either side.
      open: { bottom: 1.625, half: .095 }, buttons: [1.6, 1.49, 1.38, 1.27, 1.16],
      collar: { spread: .19, drop: .09, deeper: .012 },
      // Boxy from the chest down, to the top of her thigh; tucked into the skirt.
      rows: [[1.905, .112, .104], [1.875, .172, .126], [1.83, .236, .159], [1.775, .276, .184], [1.65, .292, .195], [1.5, .296, .204], [1.4, .302, .212], [1.3, .309, .221], [1.2, .316, .23], [1.12, .323, .235], [1.02, .328, .24]],
      tucked: [[1.905, .112, .104], [1.875, .172, .126], [1.83, .236, .159], [1.775, .276, .184], [1.65, .292, .195], [1.5, .296, .204], [1.4, .302, .212], [1.33, .294, .206], [1.26, .29, .205]],
      shirttail: { from: 1.24, centre: 1.02, side: 1.09 },
      sleeve: [[.025, .112, .114], [-.04, .128, .126], [-.16, .13, .125], [-.28, .126, .12], [-.38, .117, .112], [-.45, .1, .098], [-.49, .089, .089], [-.53, .085, .086]],
      cuff: { from: -.455, to: -.535, button: true },
      backYoke: 1.79,
    },
    // The study preset: added to the outfit ideas with the other top studies; the shirt fills its own slot.
    study: { name: 'Black satin shirt study', note: 'An oversized black satin button-up made to the user\'s description (no photos): open in a deep V under a wide point collar, with full sleeves into buttoned cuffs and a curved shirt tail, over the Topshop acid-wash barrel jeans. The satin is drawn in code.', recipe: { bottomId: 'topshop-barrel-jeans-v1' } },
};
