// Wardrobe item: Levi's watercolour wildflower print shirt. Record: docs/garments/levis-wildflower-print-shirt.md.
// One garment per file (see src/wardrobe/garments/index.js); the entry is the same as a catalog.js entry, plus its study.
export default {
    slot: 'top',
    id: 'levis-wildflower-print-shirt-v1', name: "Levi's wildflower print shirt", family: 'printed-button-down-shirt', version: 1,
    // Merging this garment's pull request is the user's approval (their rule, 9 October 2026).
    status: 'user-approved', brandAsProvided: "Levi's (the listing; no label shows)",
    source: { note: 'user supplied three product photos without a description: the front on a model (tucked into light jeans), the back on a model, and the front on a model, closer' },
    referenceViews: ['front on model', 'back on model', 'front on model, closer'],
    details: ['soft, fluid crepe printed all over with a watercolour meadow on a peach-cream ground: lilac leaves and lily heads, fine green stems and sprigs, clusters of orange, red five-petal flowers, salmon blossoms and speckles', 'a long, pointed 1970s collar', 'small cream buttons down a plain placket; worn buttoned to the top, as the user wears their shirts (on the model the top button is open)', 'long sleeves into long buttoned cuffs', 'a back yoke', 'regular fit, hip length with a curved shirt-tail hem'],
    material: { construction: 'soft woven crepe (viscose or polyester)', composition: 'not stated in the supplied photos', finish: 'fluid, with a soft sheen' },
    fit: { silhouette: 'regular', sleeve: 'long, with long buttoned cuffs', hem: 'hip length, curved shirt tail', neckline: 'long point collar, buttoned to the top', adjustment: 'fixed authored fit for review; the model tucks it into high-rise jeans, and on the doll it hangs over the waistband' },
    exclusions: ['striped-shirt','knit-sweater'],
    // Hangs over every waistband; over the skirt it is tucked in, so the skirt's bow shows.
    layering: { coversWaistband: true, tucksIntoSkirt: true },
    uncertainties: ['the print is drawn in code from the colours measured in the photos, not copied: its flowers are simplified and placed at random', 'worn buttoned to the top, as the user asked for their other shirts; on the model the top button is open', 'the seams down the front seen on the model are not drawn'],
    styling: { silhouette: 'regular, hip length with a curved hem', palette: ['peach cream', 'orange', 'red', 'lilac', 'sage green'], pattern: 'all-over watercolour wildflower print', coverage: { neck: 'long point collar, buttoned to the top', sleeves: 'long, cuffed', midriff: 'covered' }, material: 'soft crepe', warmth: 1, warmthBasis: 'inferred: a light, fluid woven shirt, long-sleeved', weather: 'mild days, or as a layer under a jacket; not for cold on its own', layering: 'In the app it goes under every jacket and coat, and with every bottom and the skirt; its hem hangs over every waistband; over the skirt it is tucked in and the bow shows.', unknown: ['fibre composition'] },
    authoring: { template: 'makeWildflowerShirt() in src/doll/wildflower-shirt.js (the wildflower-shirt template, on the button-down shirt template)', texture: 'procedural wildflowerData() in src/doll/wildflower-shirt.js; colours measured in the photos', runtimeGeneration: false, sourcePhotosBundled: false },
    // The print's ground and inks (a little deeper than measured, as the studio lifts them) and how many tiles go round her
    // body, sleeve and collar, and how tall one is (outfit units); then the shirt's style settings.
    build: {
      template: 'wildflower-shirt',
      print: { seed: 41, ground: '#ecd5c4', inks: { lilac: '#c49ac0', lilacPale: '#dcbcd6', green: '#86a05a', sage: '#a9b47c', orange: '#ea8e52', orangePale: '#efb27e', red: '#d14a34', redDark: '#a8322a', salmon: '#e8907e' } },
      around: 2, high: 1.05, sleeveAround: 1, sheen: '#fbe6da',
      stitch: '#e2c4b2', button: ['#f6ece2', .25], buttons: [1.862, 1.775, 1.669, 1.564, 1.458, 1.352, 1.246, 1.14],
      shirttail: { from: 1.24, centre: 1.03, side: 1.1 },
      collar: { spread: .135, drop: .09, deeper: .012 },
      sleeve: [[.025, .11, .112], [-.04, .122, .12], [-.16, .122, .117], [-.28, .118, .113], [-.38, .11, .106], [-.45, .097, .095], [-.49, .088, .088], [-.53, .084, .085]],
      cuff: { from: -.42, to: -.535, button: true },
      backYoke: 1.79,
    },
    // The study preset: added to the outfit ideas with the other top studies; the shirt fills its own slot.
    study: { name: 'Wildflower shirt study', note: "Reference study: a Levi's shirt in a peach-cream crepe printed with a watercolour meadow (lilac leaves, green sprigs, orange and red flowers), with a long 1970s point collar, cream buttons, long buttoned cuffs and a curved hem, worn buttoned to the top over the Tommy mom jeans. The print is drawn in code, not copied.", recipe: { bottomId: 'tommy-ultra-high-mom-v1' } },
};
