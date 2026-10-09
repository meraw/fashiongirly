// Wardrobe item: Lapis blue linen button-down shirt. Record: docs/garments/linen-button-down-shirts.md.
// One garment per file (see src/wardrobe/garments/index.js); the entry is the same as a catalog.js entry, plus its study.
export default {
    slot: 'top',
    id: 'lapis-blue-linen-button-down-shirt-v1', name: 'Lapis blue linen button-down shirt', family: 'relaxed-button-down-shirt', version: 1, label: 'Lapis blue linen button-down shirt · study',
    status: 'authored-awaiting-user-review', brandAsProvided: 'none given',
    source: { note: 'the user asked for two linen button-down shirts, one white and one lapis blue, without photos or further description; built as a classic relaxed linen shirt' },
    referenceViews: [],
    details: ['lapis blue linen in a slubby plain weave, softly creased', 'relaxed, hip length with a curved shirt tail', 'point collar on a stand, topstitched', 'eight tonal blue buttons from the collar stand to the hem; worn buttoned to the top', 'patch chest pocket on her left', 'back yoke', 'long sleeves with buttoned cuffs', 'tonal stitching'],
    material: { construction: 'plain-weave linen', composition: 'linen, as the user described it', finish: 'matte, slubby, softly creased' },
    fit: { silhouette: 'relaxed', sleeve: 'long and relaxed, with buttoned cuffs at the wrist', hem: 'hip length, curved shirt tail', neckline: 'point collar, buttoned to the top', adjustment: 'fixed authored fit for review' },
    exclusions: ['striped-shirt','knit-sweater'],
    // Hangs over every waistband; over the skirt it is tucked in, so the skirt's bow shows.
    layering: { coversWaistband: true, tucksIntoSkirt: true },
    uncertainties: ['no photos: the cut, collar, pocket, buttons and exact shade are a classic linen shirt chosen for the description, not read from the user\'s shirt', 'the linen and its slubs are woven in code; the creases are a soft, fixed pattern'],
    styling: { silhouette: 'relaxed, hip length with a curved hem', palette: ['lapis blue'], pattern: 'plain, with linen slubs', coverage: { neck: 'point collar, buttoned to the top', sleeves: 'long, cuffed', midriff: 'covered' }, material: 'linen', warmth: 1, warmthBasis: 'inferred: a light, breathable linen shirt, long-sleeved', weather: 'warm to mild days' },
    authoring: { template: 'makeLinenShirt() in src/doll/shirts.js (the linen-shirt template, on the button-down shirt template)', texture: 'procedural linenWeave() in src/doll/shirts.js, woven locally when first worn', runtimeGeneration: false, sourcePhotosBundled: false },
    // The linen's colour (much darker than it renders, calibrated to Pantone Lapis Blue), its slubs a little lighter (`lift`),
    // the weave's seed, the tonal stitching, tonal blue buttons [colour, roughness] and the sheen.
    build: { template: 'linen-shirt', colour: '#033068', lift: .09, seed: 9, stitch: '#0a2f63', button: ['#11315f', .25], sheen: '#7f9fd6' },
    // The study preset: added to the outfit ideas with the other top studies; the shirt fills its own slot.
    study: { name: 'Lapis linen shirt study', note: 'The same relaxed linen button-down in lapis blue, made to the user\'s description (no photos), with tonal blue buttons. The slubby linen and its soft creases are drawn in code.', recipe: { bottomId: 'crystal-straight-jeans-v1' } },
};
