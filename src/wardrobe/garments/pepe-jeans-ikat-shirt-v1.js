// Wardrobe item: Pepe Jeans ikat print shirt. Record: docs/garments/pepe-jeans-ikat-shirt.md.
// One garment per file (see src/wardrobe/garments/index.js); the entry is the same as a catalog.js entry, plus its study.
// Its construction is a style in src/doll/shirts.js (the button-down shirt template); its print is drawn in
// src/doll/ikat-print.js.
export default {
    slot: 'top',
    id: 'pepe-jeans-ikat-shirt-v1', name: 'Pepe Jeans ikat print shirt', family: 'button-down-shirt', version: 1,
    status: 'reference-study-awaiting-visual-review', brandAsProvided: 'Pepe Jeans (label inside the collar)',
    source: { note: 'user supplied two photos, all they could find: a studio flat lay of the shirt and their own flat lay on a wooden floor (sleeves rolled up in both)' },
    referenceViews: ['studio flat lay, front', 'user\'s flat lay, front'],
    details: ['long-sleeved button-down shirt in a light, slightly slubbed woven', 'ikat print: soft vertical streaks of lavender and periwinkle on white, with tall feathered diamonds: navy clusters of four parted by a white cross, single and paired navy diamonds, and coral diamonds', 'point collar, the stand and back neck lined in blue chambray', 'pale buttons down the front; the top one open in the flat lay', 'one patch chest pocket on her left', 'buttoned cuffs', 'curved shirttail hem, longer at the front and back than at the sides, falling past the hips'],
    material: { construction: 'light woven (cotton or viscose voile, read from the photos)', composition: 'not visible in the supplied photos', finish: 'matte, soft' },
    fit: { silhouette: 'straight, loose over the hips', sleeve: 'long, to the wrist, with buttoned cuffs', hem: 'curved shirttail, past the hips, worn loose', neckline: 'point collar, top button open', adjustment: 'fixed authored fit for review' },
    exclusions: ['striped-shirt','knit-sweater'],
    layering: { coversWaistband: true },
    uncertainties: ['the print is drawn procedurally from the photos\' colours and motifs, not copied; its repeat is simplified', 'the studio photo and the user\'s photo differ in colour (the user\'s photo is bluer and pinker); the studio colours are used', 'the length and fit are read from flat lays only; it is worn loose, untucked', 'both photos show the sleeves rolled up; it is built with the cuffs down'],
    styling: { silhouette: 'straight button-down, loose past the hips', palette: ['white', 'periwinkle', 'lavender', 'navy', 'coral'], pattern: 'ikat: feathered vertical streaks with navy and coral diamonds', coverage: { neck: 'point collar, top button open', sleeves: 'long', midriff: 'covered' }, material: 'light woven voile', warmth: 1, warmthBasis: 'inferred: a light, thin woven shirt', weather: 'warm or mild days; a light layer under a jacket' },
    authoring: { template: 'makeButtonShirt() in src/doll/shirts.js', texture: 'procedural ikatData() in src/doll/ikat-print.js, drawn locally when first worn; colours measured from the studio photo', runtimeGeneration: false, sourcePhotosBundled: false },
    study: { name: 'Ikat shirt study', note: 'Reference study: a Pepe Jeans shirt in a white and periwinkle ikat with navy and coral diamonds, worn loose over the Levi\'s washed black wide legs, top button open.', recipe: { bottomId: 'levis-94-wide-leg-v1' } },
};
