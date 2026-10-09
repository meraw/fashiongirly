// Wardrobe item: Levi's lilac gingham shirt. Record: docs/garments/levis-lilac-gingham-shirt.md.
// One garment per file (see src/wardrobe/garments/index.js); the entry is the same as a catalog.js entry, plus its study.
export default {
    slot: 'top',
    id: 'levis-lilac-gingham-shirt-v1', name: "Levi's lilac gingham shirt", family: 'relaxed-button-down-shirt', version: 1,
    status: 'user-approved', brandAsProvided: "Levi's, read from the tonal batwing embroidered on the chest (no label shows)",
    source: { note: 'user supplied four product photos without a description: the back on a model, the front on a model, full length over grey skinny jeans, and a close-up of the collar and chest' },
    referenceViews: ['back on model', 'front on model', 'front, full length', 'collar and chest close-up'],
    details: ['soft twill in a small lilac gingham: white squares crossed by purple stripes, each edged with a fine pink line, darker purple where they cross', 'point collar', 'white buttons down a plain placket; worn buttoned to the top here, as the user wears her shirts (on the model the top button is open)', 'a small tonal batwing embroidered on the left chest', 'back yoke with a centre box pleat below it', 'long sleeves with buttoned cuffs', 'hip length with a curved shirt tail'],
    material: { construction: 'soft twill (viscose or cotton) woven in a check', composition: 'not stated in the supplied photos', finish: 'smooth, with a soft sheen' },
    fit: { silhouette: 'regular, relaxed', sleeve: 'long, with buttoned cuffs', hem: 'hip length, curved shirt tail', neckline: 'point collar, buttoned to the top', adjustment: 'fixed authored fit for review' },
    exclusions: ['striped-shirt','knit-sweater'],
    // Hangs over every waistband; over the skirt it is tucked in, so the skirt's bow shows.
    layering: { coversWaistband: true, tucksIntoSkirt: true },
    uncertainties: ['the check is woven in code from the colours and stripe widths measured in the close-up, not copied; it is a little larger than on the shirt, to suit her proportions', 'the batwing is drawn in code at her scale as a suggestion of the mark', 'worn buttoned to the top, as the user asked for her other shirts; on the model the top button is open'],
    styling: { silhouette: 'regular, hip length with a curved hem', palette: ['white', 'lilac', 'purple'], pattern: 'small gingham check', coverage: { neck: 'point collar, buttoned to the top', sleeves: 'long, cuffed', midriff: 'covered' }, material: 'soft twill', warmth: 1, warmthBasis: 'inferred: a light woven shirt, long-sleeved', weather: 'mild days, or as a layer', layering: 'In the app it goes under every jacket and coat, and with every bottom and the skirt; its hem hangs over every waistband; over the skirt it is tucked in and the bow shows.', unknown: ['fibre composition (viscose or cotton)'] },
    authoring: { template: 'makeCheckShirt() in src/doll/shirts.js (the check-shirt template, on the button-down shirt template)', texture: 'procedural wovenCheckData() and batwingData() in src/doll/shirts.js; colours and stripe widths measured in the close-up', runtimeGeneration: false, sourcePhotosBundled: false },
    // The weave: thread colours (deeper than measured, as the studio lifts them) and one repeat of the sett, in units of
    // `unit` pixels, woven `repeats` times on a tile; then how many tiles go round her and how tall one is, in outfit units.
    build: {
      template: 'check-shirt',
      check: { colours: { white: [220, 214, 222], pink: [200, 148, 198], purple: [118, 70, 160] }, warp: [['white', 14], ['pink', 2], ['purple', 7], ['pink', 2]], weft: [['white', 14], ['pink', 2], ['purple', 7], ['pink', 2]], unit: 2, repeats: 4 },
      around: 13, high: .12, sleeveAround: 6, collarAround: 6, sheen: '#f6eef8',
      stitch: '#ddd6e0', button: ['#f6f4f0', .22], buttons: [1.862, 1.775, 1.669, 1.564, 1.458, 1.352, 1.246, 1.14],
      shirttail: { from: 1.24, centre: 1.03, side: 1.1 },
      sleeve: [[.025, .11, .112], [-.04, .122, .12], [-.16, .122, .117], [-.28, .118, .113], [-.38, .11, .106], [-.45, .097, .095], [-.49, .088, .088], [-.53, .084, .085]],
      cuff: { from: -.45, to: -.535, button: true },
      backYoke: 1.79, backPleat: 1.55,
      logo: { at: [.145, 1.735], size: [.05, .03], colour: '#f2eef2' },
    },
    // The study preset: added to the outfit ideas with the other top studies; the shirt fills its own slot.
    study: { name: 'Lilac gingham shirt study', note: "Reference study: a Levi's shirt in a small lilac gingham with a point collar, white buttons, a tonal batwing on the chest, a back yoke with a box pleat, buttoned cuffs and a curved shirt tail, worn buttoned to the top over washed black jeans. The check is woven in code from the photos, not copied.", recipe: { bottomId: 'mango-washed-black-v1' } },
};
