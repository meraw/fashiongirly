// Wardrobe item: cream ditsy rose print fitted shirt. Record: docs/garments/cream-ditsy-rose-fitted-shirt.md.
// One garment per file (see src/wardrobe/garments/index.js); the entry is the same as a catalog.js entry, plus its study.
// Built by makeDitsyPrintShirt() in src/doll/ditsy-print-shirt.js (the button-down shirt template with a ditsy print).
export default {
  slot: 'top',
  id: 'cream-ditsy-rose-fitted-shirt-v1', name: 'Cream ditsy rose print fitted shirt', family: 'fitted-printed-button-down-shirt', version: 1,
  // Merging the pull request is the user's approval (their rule), so the garment's own pull request marks it approved.
  status: 'user-approved', brandAsProvided: 'not stated (no label or logo shows in the photos)',
  source: { note: 'user supplied three product photos without a description: the front on a model with one hand in her pocket, the back and the front, both on a model over green velvet trousers' },
  referenceViews: ['front on model, hand in pocket', 'back on model', 'front on model'],
  details: ['fitted long-sleeved shirt in a soft, slightly lustrous woven (read as a viscose or silky crepe)', 'off-white ground printed all over with small sprays of chartreuse-olive roses, with tiny dark teal leaves on fine stems', 'a big pointed 1970s collar on a stand, worn open at the neck', 'white buttons down a plain placket', 'shaping darts down the front and back, nipping it in at the waist', 'long fitted sleeves into long buttoned cuffs', 'curved shirt-tail hem at the high hip'],
  material: { construction: 'soft woven with a slight sheen (read from the photos)', composition: 'not stated', finish: 'smooth, softly lustrous' },
  fit: { silhouette: 'fitted, nipped at the waist by darts', sleeve: 'long and fitted, into long buttoned cuffs', hem: 'high hip, curved shirt tail', neckline: 'big point collar, worn open at the neck', adjustment: 'fixed authored fit for review' },
  exclusions: ['striped-shirt', 'knit-sweater'],
  // Hangs over every waistband; over the skirt it is tucked in, so the skirt's bow shows.
  layering: { coversWaistband: true, tucksIntoSkirt: true },
  uncertainties: ['the print is drawn in code from the colours measured in the photos, not copied: its sprays are laid out at random, not in the real repeat, and the roses are about one and a half times their real size, so they read at her scale', 'the brand is not shown', 'the darts are drawn as stitched lines; the waist is only slightly nipped, so it clears every waistband'],
  styling: { silhouette: 'fitted shirt, high-hip length with a curved hem', palette: ['off-white', 'chartreuse', 'olive', 'dark teal'], pattern: 'ditsy floral: small sprays of roses with leaves', coverage: { neck: 'big point collar, open at the neck', sleeves: 'long, cuffed', midriff: 'covered' }, material: 'soft, slightly lustrous woven', warmth: 2, warmthBasis: 'inferred: a light woven shirt with long sleeves', weather: 'mild days, or under a jacket', layering: 'In the app it goes under every jacket and coat, and with every bottom and the skirt; its hem hangs over every waistband; over the skirt it is tucked in and the bow shows.', unknown: ['brand', 'fibre composition (viscose or a silky crepe)'] },
  authoring: { template: 'makeDitsyPrintShirt() in src/doll/ditsy-print-shirt.js (the button-down shirt template from src/doll/shirts.js, with a ditsy print and darts)', texture: 'procedural ditsy rose print (ditsyRoseData in ditsy-print-shirt.js); colours measured on the back photo', runtimeGeneration: false, sourcePhotosBundled: false },
  // Construction for makeDitsyPrintShirt(), in outfit units. The print's colours are a little deeper than measured, as the
  // studio lifts them; a tile holds `sprays` sprays of roses `size` pixels across, four tiles round her.
  build: {
    template: 'ditsy-print-shirt',
    print: { ground: [208, 202, 192], rose: [134, 122, 50], shade: [88, 80, 28], leaf: [34, 46, 47], sprays: 180, size: 9, gap: 1.5, seed: 211 },
    around: 4, high: .52, sleeveAround: 2, collarAround: 2, sheen: '#fffbea', roughness: .58,
    stitch: '#ddd6c8', button: ['#f7f5ef', .2], buttons: [1.745, 1.64, 1.535, 1.43, 1.325, 1.22],
    // Worn open at the neck, under a big 1970s point collar.
    open: { bottom: 1.76, half: .04 }, collar: { spread: .14, drop: .1, deeper: .012 },
    // Fitted: close through the chest, slightly nipped at the waist, easing over her hips to a curved shirt-tail hem that
    // clears every waistband; over the skirt it is tucked in.
    rows: [[1.905, .112, .104], [1.875, .17, .124], [1.83, .228, .154], [1.775, .265, .177], [1.65, .278, .184], [1.5, .28, .188], [1.42, .285, .196], [1.33, .3, .212], [1.26, .308, .224], [1.19, .314, .232], [1.1, .32, .236]],
    tucked: [[1.905, .112, .104], [1.875, .17, .124], [1.83, .228, .154], [1.775, .265, .177], [1.65, .278, .184], [1.5, .282, .19], [1.4, .288, .2], [1.33, .292, .205], [1.26, .29, .205]],
    shirttail: { from: 1.24, centre: 1.1, side: 1.16 },
    sleeve: [[.025, .104, .104], [-.05, .118, .114], [-.2, .116, .11], [-.33, .11, .105], [-.42, .1, .097], [-.47, .092, .09], [-.53, .088, .087]],
    cuff: { from: -.4, to: -.535, button: true },
    darts: [{ x: .1, top: 1.64, bottom: 1.12 }, { x: .1, top: 1.6, bottom: 1.12, back: true }],
  },
  // The study preset: added to the outfit ideas with the other top studies; the shirt fills its own slot.
  study: { name: 'Ditsy rose shirt study', note: 'Reference study: a fitted shirt in a cream ditsy print of small chartreuse roses with dark teal leaves, a big 1970s point collar worn open, white buttons, darts, long buttoned cuffs and a curved shirt tail, worn loose over the Levi\'s Ribcage jeans with the cream 550s. The print is drawn in code.', recipe: { bottomId: 'levis-ribcage-straight-ankle-jeans-v1', shoesId: 'new-balance-550-cream-v1' } },
};
